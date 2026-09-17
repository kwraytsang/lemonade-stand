import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';

import { useOrdersControllerCreate } from '@/lib/api/generated/customer-orders/customer-orders';
import { ApiError } from '@/lib/api-error';
import { toCreateOrderDto, type PlaceOrderInput } from '@/lib/orders-api';
import { CartItem, ContactMethod } from '@/types/order';

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  updateQuantity: (
    beverageId: string,
    sizeId: string,
    quantity: number,
  ) => void;
  removeItem: (beverageId: string, sizeId: string) => void;
  total: number;

  customerName: string;
  contactMethod: ContactMethod;
  customerContact: string;
  setContactDetails: (details: ContactDetails) => void;

  confirmationNumber: string | null;
  submitting: boolean;
  submitError: string | null;
  placeOrder: () => Promise<void>;
  reset: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const DEFAULT_CONTACT_METHOD: ContactMethod = 'phone';

type ContactDetails = {
  customerName: string;
  contactMethod: ContactMethod;
  customerContact: string;
};

const DEFAULT_CONTACT_DETAILS: ContactDetails = {
  customerName: '',
  contactMethod: DEFAULT_CONTACT_METHOD,
  customerContact: '',
};

function lineKey(beverageId: string, sizeId: string) {
  return `${beverageId}:${sizeId}`;
}

type CartItemsAction =
  | { type: 'add'; item: Omit<CartItem, 'quantity'>; quantity: number }
  | {
      type: 'update-quantity';
      beverageId: string;
      sizeId: string;
      quantity: number;
    }
  | { type: 'remove'; beverageId: string; sizeId: string }
  | { type: 'clear' };

/** Pure line-item transitions, kept separate from React so each case is easy to follow in isolation. */
function cartItemsReducer(
  items: CartItem[],
  action: CartItemsAction,
): CartItem[] {
  switch (action.type) {
    case 'add': {
      const key = lineKey(action.item.beverageId, action.item.sizeId);
      const existing = items.find(
        (line) => lineKey(line.beverageId, line.sizeId) === key,
      );
      if (existing) {
        return items.map((line) =>
          lineKey(line.beverageId, line.sizeId) === key
            ? { ...line, quantity: line.quantity + action.quantity }
            : line,
        );
      }
      return [...items, { ...action.item, quantity: action.quantity }];
    }
    case 'update-quantity': {
      const key = lineKey(action.beverageId, action.sizeId);
      if (action.quantity <= 0) {
        return items.filter(
          (line) => lineKey(line.beverageId, line.sizeId) !== key,
        );
      }
      return items.map((line) =>
        lineKey(line.beverageId, line.sizeId) === key
          ? { ...line, quantity: action.quantity }
          : line,
      );
    }
    case 'remove': {
      const key = lineKey(action.beverageId, action.sizeId);
      return items.filter(
        (line) => lineKey(line.beverageId, line.sizeId) !== key,
      );
    }
    case 'clear':
      return [];
  }
}

/** Wraps the submit-order mutation with the confirmation/error state the checkout flow needs. */
function useOrderSubmission() {
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useOrdersControllerCreate();

  const submit = useCallback(
    async (input: PlaceOrderInput) => {
      setSubmitError(null);
      try {
        const result = await mutation.mutateAsync({
          data: toCreateOrderDto(input),
        });
        setConfirmationNumber(result.data.confirmationNumber);
        return result.data.confirmationNumber;
      } catch (err) {
        setSubmitError(
          err instanceof ApiError
            ? err.message
            : 'Something went wrong placing your order. Please try again.',
        );
        return null;
      }
    },
    [mutation],
  );

  const reset = useCallback(() => {
    setConfirmationNumber(null);
    setSubmitError(null);
    mutation.reset();
  }, [mutation]);

  return {
    confirmationNumber,
    submitting: mutation.isPending,
    submitError,
    submit,
    reset,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartItemsReducer, []);

  const [contactDetails, setContactDetailsState] = useState<ContactDetails>(
    DEFAULT_CONTACT_DETAILS,
  );
  const { customerName, contactMethod, customerContact } = contactDetails;

  const orderSubmission = useOrderSubmission();

  const addItem: CartContextValue['addItem'] = useCallback((item, quantity) => {
    dispatch({ type: 'add', item, quantity });
  }, []);

  const updateQuantity: CartContextValue['updateQuantity'] = useCallback(
    (beverageId, sizeId, quantity) => {
      dispatch({ type: 'update-quantity', beverageId, sizeId, quantity });
    },
    [],
  );

  const removeItem: CartContextValue['removeItem'] = useCallback(
    (beverageId, sizeId) => {
      dispatch({ type: 'remove', beverageId, sizeId });
    },
    [],
  );

  const total = useMemo(
    () => items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [items],
  );

  const placeOrder = useCallback(async () => {
    const confirmationNumber = await orderSubmission.submit({
      customerName: customerName.trim(),
      contactMethod,
      customerContact: customerContact.trim(),
      items,
    });
    if (confirmationNumber) {
      dispatch({ type: 'clear' });
    }
  }, [orderSubmission, customerName, contactMethod, customerContact, items]);

  const reset = useCallback(() => {
    dispatch({ type: 'clear' });
    setContactDetailsState(DEFAULT_CONTACT_DETAILS);
    orderSubmission.reset();
  }, [orderSubmission]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      total,
      customerName,
      contactMethod,
      customerContact,
      setContactDetails: setContactDetailsState,
      confirmationNumber: orderSubmission.confirmationNumber,
      submitting: orderSubmission.submitting,
      submitError: orderSubmission.submitError,
      placeOrder,
      reset,
    }),
    [
      items,
      addItem,
      updateQuantity,
      removeItem,
      total,
      customerName,
      contactMethod,
      customerContact,
      orderSubmission.confirmationNumber,
      orderSubmission.submitting,
      orderSubmission.submitError,
      placeOrder,
      reset,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

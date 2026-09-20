import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, TextInput } from 'react-native';

import { LoadingState } from '@/components/common/loading-state';
import { PrimaryButton } from '@/components/common/primary-button';
import { ScreenLayout } from '@/components/common/screen-layout';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useCart } from '@/context/cart-context';
import { detailsSchema, type DetailsFormValues } from '@/lib/details-schema';
import { ContactMethod } from '@/types/order';

const inputClassName =
  'rounded-2xl border border-border px-4 py-4 text-base text-foreground';

export default function DetailsScreen() {
  const {
    items,
    customerName,
    contactMethod,
    customerContact,
    setContactDetails,
  } = useCart();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { customerName, contactMethod, customerContact },
  });

  const selectedMethod = useWatch({ control, name: 'contactMethod' });

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items.length]);

  const onSubmit = (values: DetailsFormValues) => {
    setContactDetails({
      customerName: values.customerName.trim(),
      contactMethod: values.contactMethod,
      customerContact: values.customerContact.trim(),
    });
    router.push('/review');
  };

  if (items.length === 0) {
    return <LoadingState />;
  }

  return (
    <ScreenLayout
      edges={['bottom']}
      keyboardAvoiding
      scroll
      contentContainerClassName="px-4 pt-4 pb-4"
      keyboardShouldPersistTaps="handled"
      bottomBar={
        <ThemedView className="px-4 pt-2">
          <PrimaryButton
            label="Review order"
            onPress={handleSubmit(onSubmit)}
          />
        </ThemedView>
      }
    >
      <ThemedText type="eyebrow" themeColor="foreground-secondary">
        Step 2 of 3
      </ThemedText>
      <ThemedText themeColor="foreground-secondary">
        We&apos;ll use this to identify your order and let you know when
        it&apos;s ready.
      </ThemedText>

      <ThemedText type="smallBold" className="mt-6 mb-2">
        Your name
      </ThemedText>
      <Controller
        control={control}
        name="customerName"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="e.g. Jane Doe"
            placeholderTextColorClassName="accent-foreground-secondary"
            className={inputClassName}
          />
        )}
      />
      {errors.customerName ? (
        <ThemedText themeColor="destructive" className="mt-1">
          {errors.customerName.message}
        </ThemedText>
      ) : null}

      <ThemedText type="smallBold" className="mt-6 mb-2">
        Best way to reach you
      </ThemedText>
      <Controller
        control={control}
        name="contactMethod"
        render={({ field: { onChange } }) => (
          <ThemedView className="flex-row gap-2">
            {(['phone', 'email'] as ContactMethod[]).map((method) => {
              const selected = method === selectedMethod;
              return (
                <Pressable
                  key={method}
                  onPress={() => {
                    if (method === selectedMethod) return;
                    onChange(method);
                    setValue('customerContact', '');
                  }}
                  className="flex-1"
                >
                  <ThemedView
                    type={selected ? 'accent' : 'background'}
                    className="items-center rounded-2xl border border-border py-4"
                  >
                    <ThemedText
                      type="smallBold"
                      themeColor={selected ? 'accent-foreground' : 'foreground'}
                    >
                      {method === 'phone' ? 'Phone' : 'Email'}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              );
            })}
          </ThemedView>
        )}
      />

      <Controller
        control={control}
        name="customerContact"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={
              selectedMethod === 'phone' ? 'Phone number' : 'Email address'
            }
            placeholderTextColorClassName="accent-foreground-secondary"
            keyboardType={
              selectedMethod === 'phone' ? 'phone-pad' : 'email-address'
            }
            autoCapitalize="none"
            className={`${inputClassName} mt-2`}
          />
        )}
      />
      {errors.customerContact ? (
        <ThemedText themeColor="destructive" className="mt-1">
          {errors.customerContact.message}
        </ThemedText>
      ) : null}
    </ScreenLayout>
  );
}

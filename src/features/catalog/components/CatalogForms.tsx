import { useState, type FormEvent, type ReactNode } from 'react';

import {
  Button,
  Checkbox,
  Input,
  Modal,
  Select,
  TextArea,
  useToast,
} from '@/components/ui';
import {
  useSaveAddon,
  useSaveCategory,
  useSaveColor,
  useSaveProduct,
  type Addon,
  type Color,
  type Product,
  type ProductCategory,
} from '@/features/catalog/api';
import {
  addonSchema,
  colorSchema,
  productCategorySchema,
  productSchema,
} from '@/validation';

type Errors = Record<string, string | undefined>;

function collectErrors(issues: { path: (string | number)[]; message: string }[]) {
  const errors: Errors = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    errors[key] ??=
      issue.message.startsWith('Expected') || issue.message.startsWith('String must')
        ? 'Please fill this in correctly.'
        : issue.message;
  }
  return errors;
}

function FormModal({
  children,
  formId,
  isOpen,
  isSaving,
  onClose,
  onSubmit,
  submitLabel,
  title,
}: {
  title: string;
  formId: string;
  isOpen: boolean;
  isSaving: boolean;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (form: FormData) => void;
  children: ReactNode;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={isSaving}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="grid gap-4"
        noValidate
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          onSubmit(new FormData(event.currentTarget));
        }}
      >
        {children}
      </form>
    </Modal>
  );
}

const availabilityOptions = [
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Not available' },
];

function useSaveFeedback(onClose: () => void) {
  const { showToast } = useToast();

  return async (save: () => Promise<unknown>, title: string) => {
    try {
      await save();
      showToast({ variant: 'success', title });
      onClose();
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Not saved',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };
}

const optionalNumber = (value: FormDataEntryValue | null) =>
  value === null || value === '' ? null : Number(value);

export function ProductFormModal({
  categories,
  colors,
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  product: Product | null;
  categories: ProductCategory[];
  colors: Color[];
  onClose: () => void;
}) {
  const save = useSaveProduct();
  const finish = useSaveFeedback(onClose);
  const [errors, setErrors] = useState<Errors>({});

  return (
    <FormModal
      title={product ? 'Edit bouquet' : 'Add bouquet'}
      formId="product-form"
      isOpen={isOpen}
      isSaving={save.isPending}
      submitLabel={product ? 'Save changes' : 'Add bouquet'}
      onClose={onClose}
      onSubmit={(form) => {
        const parsed = productSchema.safeParse({
          product_name: form.get('product_name'),
          category_id: form.get('category_id') || null,
          stem_count: optionalNumber(form.get('stem_count')),
          base_price: Number(form.get('base_price')),
          availability: form.get('availability'),
          description: form.get('description') || null,
          colorIds: form.getAll('colorIds').map(String),
        });

        if (!parsed.success) {
          setErrors(collectErrors(parsed.error.issues));
          return;
        }

        setErrors({});
        void finish(
          () => save.mutateAsync({ id: product?.id, values: parsed.data }),
          product ? 'Bouquet updated' : 'Bouquet added',
        );
      }}
    >
      <div key={product?.id ?? 'new'} className="grid gap-4">
        <Input
          name="product_name"
          label="Name"
          required
          defaultValue={product?.product_name}
          error={errors.product_name}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            name="base_price"
            label="Price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={product?.base_price}
            error={errors.base_price}
          />
          <Input
            name="stem_count"
            label="Stems"
            type="number"
            min={1}
            defaultValue={product?.stem_count ?? ''}
            error={errors.stem_count}
          />
          <Select
            name="availability"
            label="Availability"
            defaultValue={product?.availability ?? 'available'}
            options={availabilityOptions}
          />
        </div>
        <Select
          name="category_id"
          label="Category"
          defaultValue={product?.category_id ?? ''}
          options={[
            { value: '', label: 'No category' },
            ...categories.map((category) => ({
              value: category.id,
              label: category.name,
            })),
          ]}
        />
        <fieldset>
          <legend className="text-sm font-medium text-text">Colors offered</legend>
          {colors.length ? (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {colors.map((color) => (
                <Checkbox
                  key={color.id}
                  name="colorIds"
                  value={color.id}
                  defaultChecked={product?.colorIds.includes(color.id)}
                  label={
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="size-3 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: color.hex_color }}
                      />
                      {color.color_name}
                    </span>
                  }
                />
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted">Add colors in the Colors tab first.</p>
          )}
        </fieldset>
        <TextArea
          name="description"
          label="Description"
          defaultValue={product?.description ?? ''}
        />
      </div>
    </FormModal>
  );
}

export function AddonFormModal({
  addon,
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  addon: Addon | null;
  onClose: () => void;
}) {
  const save = useSaveAddon();
  const finish = useSaveFeedback(onClose);
  const [errors, setErrors] = useState<Errors>({});

  return (
    <FormModal
      title={addon ? 'Edit add-on' : 'Add add-on'}
      formId="addon-form"
      isOpen={isOpen}
      isSaving={save.isPending}
      submitLabel={addon ? 'Save changes' : 'Add add-on'}
      onClose={onClose}
      onSubmit={(form) => {
        const parsed = addonSchema.safeParse({
          addon_name: form.get('addon_name'),
          price: Number(form.get('price')),
          availability: form.get('availability'),
          description: form.get('description') || null,
        });

        if (!parsed.success) {
          setErrors(collectErrors(parsed.error.issues));
          return;
        }

        setErrors({});
        void finish(
          () => save.mutateAsync({ id: addon?.id, values: parsed.data }),
          addon ? 'Add-on updated' : 'Add-on added',
        );
      }}
    >
      <div key={addon?.id ?? 'new'} className="grid gap-4">
        <Input
          name="addon_name"
          label="Name"
          required
          defaultValue={addon?.addon_name}
          error={errors.addon_name}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="price"
            label="Price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={addon?.price}
            error={errors.price}
          />
          <Select
            name="availability"
            label="Availability"
            defaultValue={addon?.availability ?? 'available'}
            options={availabilityOptions}
          />
        </div>
        <TextArea
          name="description"
          label="Description"
          defaultValue={addon?.description ?? ''}
        />
      </div>
    </FormModal>
  );
}

export function ColorFormModal({
  color,
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  color: Color | null;
  onClose: () => void;
}) {
  const save = useSaveColor();
  const finish = useSaveFeedback(onClose);
  const [errors, setErrors] = useState<Errors>({});
  const [hex, setHex] = useState(color?.hex_color ?? '#E8A0BF');

  return (
    <FormModal
      title={color ? 'Edit color' : 'Add color'}
      formId="color-form"
      isOpen={isOpen}
      isSaving={save.isPending}
      submitLabel={color ? 'Save changes' : 'Add color'}
      onClose={onClose}
      onSubmit={(form) => {
        const parsed = colorSchema.safeParse({
          color_name: form.get('color_name'),
          hex_color: String(form.get('hex_color') ?? '').toUpperCase(),
          availability: form.get('availability'),
          description: form.get('description') || null,
        });

        if (!parsed.success) {
          setErrors(collectErrors(parsed.error.issues));
          return;
        }

        setErrors({});
        void finish(
          () => save.mutateAsync({ id: color?.id, values: parsed.data }),
          color ? 'Color updated' : 'Color added',
        );
      }}
    >
      <div key={color?.id ?? 'new'} className="grid gap-4">
        <Input
          name="color_name"
          label="Name"
          required
          placeholder="Blush pink"
          defaultValue={color?.color_name}
          error={errors.color_name}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid grid-cols-[2.5rem_1fr] items-end gap-2">
            <input
              type="color"
              aria-label="Pick a color"
              value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#000000'}
              onChange={(event) => setHex(event.target.value.toUpperCase())}
              className="h-10 w-10 cursor-pointer rounded-lg border border-border-strong bg-surface p-1"
            />
            <Input
              name="hex_color"
              label="Swatch"
              value={hex}
              onChange={(event) => setHex(event.target.value)}
              error={errors.hex_color}
            />
          </div>
          <Select
            name="availability"
            label="Availability"
            defaultValue={color?.availability ?? 'available'}
            options={availabilityOptions}
          />
        </div>
        <TextArea
          name="description"
          label="Notes"
          defaultValue={color?.description ?? ''}
        />
      </div>
    </FormModal>
  );
}

export function CategoryFormModal({
  category,
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  category: ProductCategory | null;
  onClose: () => void;
}) {
  const save = useSaveCategory();
  const finish = useSaveFeedback(onClose);
  const [errors, setErrors] = useState<Errors>({});

  return (
    <FormModal
      title={category ? 'Edit category' : 'Add category'}
      formId="category-form"
      isOpen={isOpen}
      isSaving={save.isPending}
      submitLabel={category ? 'Save changes' : 'Add category'}
      onClose={onClose}
      onSubmit={(form) => {
        const parsed = productCategorySchema.safeParse({
          name: form.get('name'),
          description: form.get('description') || null,
          availability: form.get('availability'),
          sort_order: Number(form.get('sort_order') || 0),
        });

        if (!parsed.success) {
          setErrors(collectErrors(parsed.error.issues));
          return;
        }

        setErrors({});
        void finish(
          () => save.mutateAsync({ id: category?.id, values: parsed.data }),
          category ? 'Category updated' : 'Category added',
        );
      }}
    >
      <div key={category?.id ?? 'new'} className="grid gap-4">
        <Input
          name="name"
          label="Name"
          required
          defaultValue={category?.name}
          error={errors.name}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="sort_order"
            label="Display order"
            type="number"
            min={0}
            defaultValue={category?.sort_order ?? 0}
            helperText="Lower numbers are listed first."
          />
          <Select
            name="availability"
            label="Availability"
            defaultValue={category?.availability ?? 'available'}
            options={availabilityOptions}
          />
        </div>
        <TextArea
          name="description"
          label="Description"
          defaultValue={category?.description ?? ''}
        />
      </div>
    </FormModal>
  );
}

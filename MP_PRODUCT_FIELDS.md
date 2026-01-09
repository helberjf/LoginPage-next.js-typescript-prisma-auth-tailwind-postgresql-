Design: Mercado Pago fields for `Product` model

Fields added to Prisma `Product` model:

- `mp_enabled: Boolean` — flag to indicate this product is available through Mercado Pago checkout. Default `false`.
- `mp_preference_id: String?` — stores the last-created Mercado Pago `preference_id` for this product (optional, can be used for debugging or reuse logic).
- `mp_metadata: Json?` — free-form JSON to store Mercado Pago related metadata (e.g., marketplace split info, external_reference, sku mapping).
- `mp_price_decimal: Decimal?` — optional override price that will be sent to Mercado Pago. Use when marketplace/commission or alternative pricing is needed.

Mapping when creating a Mercado Pago preference (server-side):

- `title` -> `product.name`
- `description` -> `product.description`
- `unit_price` -> `product.mp_price_decimal ?? product.price`
- `quantity` -> requested quantity from the client (endpoint param)
- `currency_id` -> site default currency (e.g., "BRL" or "ARS")
- `external_reference` -> `order.id` or `product.id` depending on the flow
- `metadata` -> `product.mp_metadata` merged with order-specific metadata

Notes and edge-cases:

- Products with variations: store variation identifiers in `mp_metadata` and compute final `unit_price` before creating preference.
- Discounts or coupons should be applied server-side before building the preference (send adjusted `unit_price` or add discount items).
- Shipping: Mercado Pago supports shipping cost as additional item or separate field. Decide whether to include shipping in the preference or handle it outside.
- Idempotency: store the `preference_id` in `mp_preference_id` and persist a mapping from local `order.id` to `preference_id` to avoid creating duplicate preferences for retries.

Security:

- Keep `MP_ACCESS_TOKEN` secret in environment variables.
- Webhook requests must be validated using `MP_WEBHOOK_KEY` or signature method recommended by Mercado Pago.

Next steps:

- Implement server API to create preference using these mappings.
- Add webhook endpoint to reconcile payments and update `Order`/`Product` state.
- Add admin UI to toggle `mp_enabled` and populate `mp_metadata` and `mp_price_decimal`.

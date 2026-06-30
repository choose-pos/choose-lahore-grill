import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const termsPagePath = join(root, "app", "terms-policies", "page.tsx");
const marketingFooterPath = join(
  root,
  "components",
  "theme_custom",
  "components",
  "Footer.tsx"
);
const orderingFooterPath = join(root, "components", "Footer.tsx");

assert.ok(existsSync(termsPagePath), "Terms & Policies page is missing");

const termsPage = readFileSync(termsPagePath, "utf8");
const normalizedTermsPage = termsPage
  .replace(/\\'/g, "'")
  .replace(/\\"/g, '"')
  .replace(/\s+/g, " ");

[
  "Terms & Policies",
  'Lahore Grill ("we," "us," "our") operates this website using the Choose online ordering platform',
  "This page describes Lahore Grill's policies for orders placed through this website.",
  "Order Cancellation",
  "Refunds & Returns",
  "within 24 hours of receiving your order",
  "within approximately 8 miles",
  "Third-Party Delivery Partner",
  "Lahore Grill is not responsible for delays, mishandling, or other issues once your order has been handed off to the delivery partner",
  "Rewards Program",
  "Points accumulate at a rate of 10 points per $1 spent",
  "redeemed for free menu items",
  "Email Communications",
  "Privacy & Platform Terms",
  "https://www.choosepos.com/privacy-policy",
  "https://www.choosepos.com/terms-conditions",
].forEach((expectedText) => {
  assert.ok(
    normalizedTermsPage.includes(expectedText),
    `Terms page missing expected text: ${expectedText}`
  );
});

["[Restaurant Legal Name]", "[Restaurant Name]"].forEach((placeholder) => {
  assert.ok(
    !termsPage.includes(placeholder),
    `Terms page still contains placeholder: ${placeholder}`
  );
});

assert.ok(
  !normalizedTermsPage.includes("[X hours]"),
  "Terms page still contains [X hours] placeholder"
);

["[X miles]", "[e.g., 1 point per $1 spent]", "[describe rewards"].forEach(
  (placeholder) => {
    assert.ok(
      !normalizedTermsPage.includes(placeholder),
      `Terms page still contains placeholder: ${placeholder}`
    );
  }
);

[marketingFooterPath, orderingFooterPath].forEach((footerPath) => {
  const footer = readFileSync(footerPath, "utf8");

  assert.ok(
    footer.includes('/terms-policies') || footer.includes('"/terms-policies"'),
    `${footerPath} does not link to /terms-policies`
  );
  assert.ok(
    footer.includes("Terms & Policies"),
    `${footerPath} does not label the terms link`
  );
});

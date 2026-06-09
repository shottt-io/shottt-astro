import type { APIRoute } from 'astro';
import { db } from '../../db/db';
import { vendors as vendorsTable, vendorUsers as vendorUsersTable } from '../../db/schema';
import { getSession } from '../../utils/auth';
import { eq, and } from 'drizzle-orm';
import { purgeVendorCache } from '../../utils/purge';
import { useTranslations } from '../../utils/i18n';

// Helper to check user access to a vendor ID
async function checkVendorAccess(userId: number, vendorId: number): Promise<boolean> {
  const access = await db
    .select()
    .from(vendorUsersTable)
    .where(and(eq(vendorUsersTable.userId, userId), eq(vendorUsersTable.vendorId, vendorId)))
    .limit(1);
  return access.length > 0;
}

// PATCH: Update vendor details (supports partial updates)
export const PATCH: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: t('unauthorized') }), { status: 401 });
  }

  try {
    const data = await request.json();
    const { slug, name, type, slogan, description, defaultLayout, logoIcon, logo, theme, locale } = data;

    if (!slug) {
      return new Response(JSON.stringify({ success: false, message: t('requiredFieldsMissing') }), { status: 400 });
    }

    // Lookup vendor by slug
    const vendorList = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, slug))
      .limit(1);

    if (vendorList.length === 0) {
      return new Response(JSON.stringify({ success: false, message: t('vendorNotFound') }), { status: 404 });
    }

    const vendor = vendorList[0];

    // Check user access
    const hasAccess = await checkVendorAccess(session.userId, vendor.id);
    if (!hasAccess) {
      return new Response(JSON.stringify({ success: false, message: t('noAccessToVendor') }), { status: 403 });
    }

    // Merge incoming changes with existing vendor data
    const updatedData = {
      name: name !== undefined ? name : vendor.name,
      type: type !== undefined ? type : vendor.type,
      slogan: slogan !== undefined ? slogan : vendor.slogan,
      description: description !== undefined ? description : vendor.description,
      defaultLayout: defaultLayout !== undefined ? defaultLayout : vendor.defaultLayout,
      logoIcon: logoIcon !== undefined ? logoIcon : vendor.logoIcon,
      logo: logo !== undefined ? logo : vendor.logo,
      theme: theme !== undefined ? theme : vendor.theme,
      locale: locale !== undefined ? (locale === '' ? null : locale) : vendor.locale,
    };

    // Perform update
    await db
      .update(vendorsTable)
      .set(updatedData)
      .where(eq(vendorsTable.id, vendor.id));

    // Purge CDN cache for this vendor so changes are immediately visible
    purgeVendorCache(slug).catch(() => {});

    return new Response(JSON.stringify({ success: true, message: t('successSettingsSaved') }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: t('serverError') }), { status: 500 });
  }
};

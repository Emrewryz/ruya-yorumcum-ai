import crypto from 'crypto';

export const SHOPIER_CONFIG = {
  apiKey: process.env.SHOPIER_API_KEY,
  apiSecret: process.env.SHOPIER_API_SECRET,
  websiteIndex: 1,
  isLive: true
};

export function generateShopierForm(data: {
  orderId: string;
  price: number;
  userEmail: string;
  userName: string;
  userPhone: string;
  productName: string;
}) {
  const args = {
    API_KEY: SHOPIER_CONFIG.apiKey,
    WEBSITE_INDEX: SHOPIER_CONFIG.websiteIndex,
    PLATFORM_ORDER_ID: data.orderId,
    PRODUCT_NAME: data.productName,
    PRODUCT_TYPE: 1, // Dijital Ürün
    BUYER_NAME_LASTNAME: data.userName,
    BUYER_EMAIL: data.userEmail,
    BUYER_PHONE: data.userPhone,
    BUYER_ADDRESS_LINE1: 'Dijital Teslimat',
    BUYER_CITY: 'Antalya',
    BUYER_COUNTRY: 'Turkiye',
    BUYER_POSTAL_CODE: '07000',
    PRODUCT_PRICE: data.price,
    CURRENCY: 0, // TL
    MODUL_VERSION: '1.0.4',
    CALLBACK_URL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/callback`
  };

  const signatureData = [
    args.API_KEY, args.WEBSITE_INDEX, args.PLATFORM_ORDER_ID,
    args.PRODUCT_TYPE, args.PRODUCT_NAME, args.PRODUCT_PRICE, args.CURRENCY
  ];
  
  const signature = crypto.createHmac('sha256', SHOPIER_CONFIG.apiSecret!).update(signatureData.join('')).digest('base64');

  return `
    <!doctype html>
    <html lang="tr">
    <head><meta charset="UTF-8"><title>Ödeme Yönlendiriliyor...</title></head>
    <body>
      <div style="text-align:center;margin-top:50px;"><h3>Güvenli ödeme sayfasına yönlendiriliyorsunuz...</h3></div>
      <form action="${SHOPIER_CONFIG.isLive ? 'https://www.shopier.com/ShowProduct/api_pay4.php' : 'https://www.shopier.com/ShowProduct/api_pay4.php'}" method="post" id="shopier_form">
        <input type="hidden" name="API_KEY" value="${args.API_KEY}">
        <input type="hidden" name="WEBSITE_INDEX" value="${args.WEBSITE_INDEX}">
        <input type="hidden" name="PLATFORM_ORDER_ID" value="${args.PLATFORM_ORDER_ID}">
        <input type="hidden" name="PRODUCT_NAME" value="${args.PRODUCT_NAME}">
        <input type="hidden" name="PRODUCT_TYPE" value="${args.PRODUCT_TYPE}">
        <input type="hidden" name="BUYER_NAME_LASTNAME" value="${args.BUYER_NAME_LASTNAME}">
        <input type="hidden" name="BUYER_EMAIL" value="${args.BUYER_EMAIL}">
        <input type="hidden" name="BUYER_PHONE" value="${args.BUYER_PHONE}">
        <input type="hidden" name="BUYER_ADDRESS_LINE1" value="${args.BUYER_ADDRESS_LINE1}">
        <input type="hidden" name="BUYER_CITY" value="${args.BUYER_CITY}">
        <input type="hidden" name="BUYER_COUNTRY" value="${args.BUYER_COUNTRY}">
        <input type="hidden" name="BUYER_POSTAL_CODE" value="${args.BUYER_POSTAL_CODE}">
        <input type="hidden" name="PRODUCT_PRICE" value="${args.PRODUCT_PRICE}">
        <input type="hidden" name="CURRENCY" value="${args.CURRENCY}">
        <input type="hidden" name="MODUL_VERSION" value="${args.MODUL_VERSION}">
        <input type="hidden" name="CALLBACK_URL" value="${args.CALLBACK_URL}">
        <input type="hidden" name="RANDOM_NR" value="${Math.floor(Math.random() * 999999)}">
        <input type="hidden" name="SIGNATURE" value="${signature}">
      </form>
      <script>document.getElementById("shopier_form").submit();</script>
    </body>
    </html>
  `;
}
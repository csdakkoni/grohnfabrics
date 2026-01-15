declare module 'iyzipay' {
  interface IyzipayConfig {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  interface BasketItem {
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: string;
  }

  interface Buyer {
    id: string;
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    identityNumber: string;
    registrationAddress: string;
    city: string;
    country: string;
    ip: string;
  }

  interface Address {
    contactName: string;
    city: string;
    country: string;
    address: string;
  }

  interface CheckoutFormInitializeRequest {
    locale: string;
    conversationId: string;
    price: string;
    paidPrice: string;
    currency: string;
    basketId: string;
    paymentGroup: string;
    callbackUrl: string;
    enabledInstallments: number[];
    buyer: Buyer;
    shippingAddress: Address;
    billingAddress: Address;
    basketItems: BasketItem[];
  }

  interface CheckoutFormInitializeResult {
    status: string;
    errorCode?: string;
    errorMessage?: string;
    checkoutFormContent?: string;
    paymentPageUrl?: string;
    token?: string;
    tokenExpireTime?: number;
  }

  interface CheckoutFormInitialize {
    create(
      request: CheckoutFormInitializeRequest,
      callback: (err: Error | null, result: CheckoutFormInitializeResult) => void
    ): void;
  }

  class Iyzipay {
    constructor(config: IyzipayConfig);
    
    checkoutFormInitialize: CheckoutFormInitialize;
    
    static LOCALE: {
      TR: string;
      EN: string;
    };
    
    static CURRENCY: {
      TRY: string;
      EUR: string;
      USD: string;
      GBP: string;
    };
    
    static PAYMENT_GROUP: {
      PRODUCT: string;
      LISTING: string;
      SUBSCRIPTION: string;
    };
    
    static BASKET_ITEM_TYPE: {
      PHYSICAL: string;
      VIRTUAL: string;
    };
  }

  export default Iyzipay;
}

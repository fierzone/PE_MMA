import { Product } from './index';
import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

// Customer tab navigation
export type CustomerTabParamList = {
    Store: undefined;
    Cart: undefined;
    Account: undefined;
};

// Admin tab navigation
export type AdminTabParamList = {
    System: undefined;
    Inventory: undefined;
    Logistics: undefined;
    Users: undefined;
    Admin: undefined;
};

export type RootStackParamList = {
    Auth: undefined;
    Landing: undefined;
    CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
    AdminTabs: NavigatorScreenParams<AdminTabParamList>;
    ProductDetail: { product: Product };
    ProductForm: { product?: Product };
    AdminProductList: undefined;
    AdminUserList: undefined;
    AdminOrderList: undefined;
    OrderHistory: undefined;
};

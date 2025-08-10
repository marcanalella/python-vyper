import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const api = createApi({
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:5001'}),
    reducerPath: "adminApi",
    tagTypes: [
        "User",
        "Products",
        "Customers",
        "Trades",
        "Geography",
        "Sales",
        "Accounts",
        "Performance",
        "Dashboard",
    ],
    endpoints: (build) => ({
        //DASHBOARD
        getLastTrades: build.query({
            query: (id) => `v1/dashboard/get-last-trades`,
            providesTags: ["Dashboard"],
        }),
        getMonthlyResult: build.query({
            query: (id) => `v1/dashboard/get-monthly-result`,
            providesTags: ["Dashboard"],
        }),
        getUser: build.query({
            query: (id) => `general/user/${id}`,
            providesTags: ["User"],
        }),
        getProducts: build.query({
            query: () => "client/products",
            providesTags: ["Products"],
        }),
        getCustomers: build.query({
            query: () => "client/customers",
            providesTags: ["Customers"],
        }),
        getGeography: build.query({
            query: () => "client/geography",
            providesTags: ["Geography"],
        }),
        getSales: build.query({
            query: () => "sales/sales",
            providesTags: ["Sales"],
        }),
        getAdmins: build.query({
            query: () => "v1/accounts/get-all",
            providesTags: ["Accounts"],
        }),
        getDashboard: build.query({
            query: () => "general/dashboard",
            providesTags: ["Dashboard"],
        }),
        //TRADES VIEW API
        getTrades: build.query({
            query: () => ({
                url: "/v1/trades/get-all",
                method: "GET",
                providesTags: ["Trades"],
            }),
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetGeographyQuery,
    useGetSalesQuery,
} = api;
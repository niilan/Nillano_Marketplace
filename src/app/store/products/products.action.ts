import { createAction, props } from "@ngrx/store";

export const getProducts = createAction("[Products] get Products")

export const getProductsSuccess = createAction("[Products] get Products success",props<{message:string,products:[]}>())

export const getProductsFailure = createAction("[Products] get Products Failed",props<{error:string}>())

export const filterProducts = createAction(
    "[Products] filter Products",
    props<{ filters : any }>()
  );

  export const filterProductsSuccess = createAction(
    "[Products] filter Products success",
    props<{message:string,products:[]}>()
  );

  export const filterProductsFailure = createAction(
    "[Products] filter Products failure",
    props<{error:string}>()
  );
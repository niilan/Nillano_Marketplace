import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import { FilterComponent } from 'src/app/components/filter/filter.component';
import { InfiniteScrollCustomEvent, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { filterProducts, getProducts } from 'src/app/store/products/products.action';
import { AppState } from 'src/app/types/AppState';
import { endLoading, startLoading } from 'src/app/store/loading/loading.action';
import { ProductsserviceService } from 'src/app/services/productsservice/productsservice.service';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { SearchComponent } from 'src/app/components/search/search.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {

  handleRefresh(event:any) {
    // do some work to refresh the content here
    // ...

    // let refreshertext = document.querySelector(".refresher-refreshing-text") as HTMLElement

    // refreshertext.style.color = "#000"

    location.reload()
  
    // when the refresh is complete, call the complete() method
    setTimeout(() => {

      event.target.complete();
      
    }, 1500);
  }

  products: any = [];
  categoriesAndSubcategories: any = [];

  productsAvailable:any
  // selectedCategory: string | undefined;
  // selectedPriceRange: string | undefined;

  selectedCategory: any
  selectedSubcategory: any
  priceRange: any

  masonry: any

  constructor(private popoverController: PopoverController, private store: Store<AppState>, private productsService: ProductsserviceService, private toastController: ToastController, private activatedRoute: ActivatedRoute, private modalCtrl:ModalController) {

  }

  getProducts = false

  ngOnInit() {

    // Getting all avialable categories and subcategories
    this.productsService.getCategoriesAndSubCategoies()
    .pipe(take(1))
    .subscribe(
      (res) => {
        this.categoriesAndSubcategories = res

        // console.log(res)

        this.activatedRoute.queryParams
        .pipe(take(1))
        .subscribe(params => {
          if (params['openFilter']) {
            this.openFilter();
          }
        });

      },
      (err) => {

        console.log(err)

      })


      // Getting the states of the products at each time
    this.store.select('products')
    .subscribe(res => {

      if(!res.filter && !this.getProducts){
        this.store.dispatch(getProducts({page:1}))
        this.getProducts = true
      }
      else if(res.filter){
        this.getProducts = false
      }

      if (!res.filter && res.process) {
        this.products.length < 1 && this.store.dispatch(startLoading())
      }

      else if (res.filter && res.process) {
       this.store.dispatch(startLoading())
      }

      if (!res.filter && res.success) {
        console.log("Success")
        this.store.dispatch(endLoading())
        // console.log(res.products)
        this.products = this.products.length > 0 ? [...this.products,...res.products] : res.products

        this.productsAvailable = res.productsAvailable

        setTimeout(() => {
          let products = document.querySelector('.products') as HTMLElement
          let masonry = new Masonry(products, {
            itemSelector: '.product-item'
          })
        }, 2000);

      }

      else if (res.filter && res.success) {
        console.log("Success")
        this.store.dispatch(endLoading())
        // console.log(res.products)
        this.products = res.products

        this.productsAvailable = res.productsAvailable

        setTimeout(() => {
          let products = document.querySelector('.products') as HTMLElement
          let masonry = new Masonry(products, {
            itemSelector: '.product-item'
          })
        }, 2000);

      }

      if (res.failure) {

        this.store.dispatch(endLoading())

        // console.log(res.message)

        this.toastController.create({
          message: res.message ? res.message : "Sorry, we're unable to retrieve products at the moment. We're working to fix the issue. Please try again later.",
          color: 'danger',
          position: 'bottom',
          cssClass: 'flex-contianer',
          buttons: [
            {
              text: 'Retry',
              handler: () => {
                this.store.dispatch(getProducts({page:1}))
                this.productsService.getCategoriesAndSubCategoies()
                .pipe(take(1))
                .subscribe(
                  (res) => {
                    this.categoriesAndSubcategories = res
                  },
                  (err) => {

                    console.log(err)

                  })
              }
            }
          ]
        }).then(toast => toast.present())


      }

    })
  }


  filterProducts() {

    // this.getProducts();
    this.products = this.products.filter((product: { category: string; price: number; }) => {
      if (this.selectedCategory && product.category != this.selectedCategory) {
        return false;
      }
      if (this.priceRange) {
        if (this.priceRange === 'low' && (product.price < 50)) {
          return true;
        } else if (this.priceRange === 'medium' && (product.price >= 50 && product.price <= 100)) {
          return true;
        } else if (this.priceRange === 'high' && (product.price > 100)) {
          return true;
        } else {
          return false;
        }
      }

      return true;
    });
  }


  loadMoreProducts(event:any) {
    // Fetch more products from your database or service

    let nextPage:number = Number(localStorage.getItem('currentPage'))
   
    if(this.getProducts){
    this.store.dispatch(getProducts({page:nextPage + 1}))
    }
    

    setTimeout(() => {
      let products = document.querySelector('.products') as HTMLElement
      let masonry = new Masonry(products, {
        itemSelector: '.product-item'
      })
      event.target.complete();
    }, 2000);

  
  }

   async searchI(){
    const modal = await this.modalCtrl.create({
      component: SearchComponent,
      showBackdrop: true,
    });
    return await modal.present();
  }

  openFilter() {

    this.popoverController.create({
      component: FilterComponent,
      componentProps: {
        selectedCategory: this.selectedCategory,
        selectedSubcategory: this.selectedSubcategory,
        priceRange: this.priceRange,
        categoriesAndSubcategories: this.categoriesAndSubcategories
      }
    }).then((popover: any) => {
      console.log({ cat: this.selectedCategory, sub: this.selectedSubcategory, price: this.priceRange })
      popover.onDidDismiss().then((data: any) => {
        if (data && data.data) {
          this.selectedCategory = data.data.selectedCategory;
          this.selectedSubcategory = data.data.selectedSubcategory;
          this.priceRange = data.data.priceRange;

          // this.filterProducts()

          // console.log({ cat: this.selectedCategory, sub: this.selectedSubcategory, price: this.priceRange })

          this.store.dispatch(filterProducts({ filters: { category: this.selectedCategory, subcategory: this.selectedSubcategory, priceRange: this.priceRange } }))
          // Filter your products here using the selected values of category, subcategory and price
        }
      });
      popover.present();
    });
  }

  ionViewDidEnter() {

    console.log("Entered")

    setTimeout(() => {
      let products = document.querySelector('.products') as HTMLElement
      let masonry = new Masonry(products, {
        itemSelector: '.product-item'
      })

      console.log("timer working")
    }, 2000);

  }

  ngAfterViewInit() {

    // window.addEventListener('load',()=>{
    //   let products = document.querySelector('.products') as HTMLElement
    // this.masonry = new Masonry(products,{
    //   itemSelector : '.product-item'
    // })
    // })


  }

}

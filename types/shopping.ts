/**
 * Shopping Portal Type Definitions
 */

export interface Product {
  id: string
  name: string
  price: number
  currency: string
  image: string
  shopId: string
  category: string
  description: string
  rating: number
  reviews: number
}

export interface Shop {
  id: string
  name: string
  owner: string
  ownerName: string
  description: string
  avatar: string
  banner: string
  productCount: number
  rating: number
  followers: number
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  productCount: number
}

export interface CartItem {
  productId: string
  quantity: number
  product: Product
}

export interface FilterOptions {
  categories: string[]
  shops: string[]
  priceRange: {
    min: number
    max: number
  }
  minRating?: number
  searchQuery?: string
}

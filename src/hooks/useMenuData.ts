import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Category {
  id: string
  name: string
  sort_order: number
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  base_price: number
  is_available: boolean
  max_flavors: number
}

export interface Flavor {
  id: string
  menu_item_id: string
  name: string
  price_surcharge: number
  flavor_cost: number
}

export function useMenuData() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [catsResult, itemsResult, flavorsResult] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').eq('is_available', true),
        supabase.from('flavors').select('*'),
      ])
      if (catsResult.data) setCategories(catsResult.data)
      if (itemsResult.data) setItems(itemsResult.data)
      if (flavorsResult.data) setFlavors(flavorsResult.data)
      setLoading(false)
    }
    load()
  }, [])

  return { categories, items, flavors, loading }
}

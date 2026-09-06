const WISHLIST_KEY = 'zorashop_wishlist';

export const getWishlist = (): number[] => {
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const toggleWishlist = (productId: number): boolean => {
  try {
    const list = getWishlist();
    const idx = list.indexOf(productId);
    let added = false;
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(productId);
      added = true;
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('wishlist_updated'));
    return added;
  } catch {
    return false;
  }
};

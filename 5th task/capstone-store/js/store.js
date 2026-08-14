const KEY = 'luma-supply-cart';
let cart = JSON.parse(localStorage.getItem(KEY) || '[]');
const persist = () => localStorage.setItem(KEY, JSON.stringify(cart));
export const getCart = () => cart;
export const addToCart = id => { const item = cart.find(entry => entry.id === id); item ? item.quantity++ : cart.push({ id, quantity: 1 }); persist(); };
export const updateQuantity = (id, amount) => { const item = cart.find(entry => entry.id === id); if (!item) return; item.quantity += amount; cart = cart.filter(entry => entry.quantity > 0); persist(); };
export const cartCount = () => cart.reduce((total, item) => total + item.quantity, 0);

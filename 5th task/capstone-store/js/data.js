export const products = [
  { id: 'drift-mug', name: 'Drift Mug', category: 'Home', price: 24, color: 'Oat', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80' },
  { id: 'sol-carry', name: 'Sol Carryall', category: 'Bags', price: 78, color: 'Cedar', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80' },
  { id: 'field-notes', name: 'Field Notes', category: 'Stationery', price: 18, color: 'Moss', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80' },
  { id: 'arc-lamp', name: 'Arc Lamp', category: 'Home', price: 96, color: 'Clay', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80' },
  { id: 'day-pack', name: 'Day Pack', category: 'Bags', price: 64, color: 'Ink', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80' },
  { id: 'soft-pencil', name: 'Soft Pencil Set', category: 'Stationery', price: 14, color: 'Stone', image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=900&q=80' }
];

export const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value * 83);

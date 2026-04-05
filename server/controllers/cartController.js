const Cart = require('../models/Cart');

// ── Helper: flatten cart items + compute totalPrice ─────
const formatCartResponse = (cart) => {
  const items = cart.items.map(item => {
    const p = item.product;
    return {
      _id: item._id,
      product: p,
      name: p?.name || '',
      price: p?.price || 0,
      mrp: p?.mrp || 0,
      image: p?.images?.[0] || '',
      quantity: item.quantity,
      size: item.size || '',
      color: item.color || '',
    };
  });

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    _id: cart._id,
    user: cart.user,
    items,
    totalPrice,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price mrp images stock sizes colors');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
      // Re-fetch with populate
      cart = await Cart.findById(cart._id)
        .populate('items.product', 'name price mrp images stock sizes colors');
    }

    res.json({ success: true, cart: formatCartResponse(cart) });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === productId &&
              item.size === (size || '') &&
              item.color === (color || '')
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size: size || '', color: color || '' });
    }

    await cart.save();

    cart = await Cart.findById(cart._id)
      .populate('items.product', 'name price mrp images stock sizes colors');

    res.json({ success: true, cart: formatCartResponse(cart) });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (quantity < 1) {
      // Remove item instead
      cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();

    cart = await Cart.findById(cart._id)
      .populate('items.product', 'name price mrp images stock sizes colors');

    res.json({ success: true, cart: formatCartResponse(cart) });
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();

    cart = await Cart.findById(cart._id)
      .populate('items.product', 'name price mrp images stock sizes colors');

    res.json({ success: true, cart: formatCartResponse(cart) });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
      cart = await Cart.findById(cart._id)
        .populate('items.product', 'name price mrp images stock sizes colors');
    }
    res.json({ success: true, cart: cart ? formatCartResponse(cart) : { items: [], totalPrice: 0 } });
  } catch (error) {
    next(error);
  }
};

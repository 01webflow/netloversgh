import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some data bundles to get started
            </p>
            <Link to="/bundles">
              <Button>Browse Bundles</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/bundles" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
          </div>
          <Button variant="outline" size="sm" onClick={clearCart}>
            Clear All
          </Button>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-xl p-4 border border-border flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{item.provider}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.dataAmount}</p>
                <p className="text-xs text-muted-foreground">To: {item.recipientPhone}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  ₵{(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive/80 mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex justify-between mb-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold text-foreground">₵{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-muted-foreground">Transaction Fee</span>
            <span className="font-semibold text-foreground">₵0.00</span>
          </div>
          <hr className="border-border mb-4" />
          <div className="flex justify-between mb-6">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">₵{totalPrice.toFixed(2)}</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={() =>
              navigate("/checkout", {
                state: {
                  bundle: items[0],
                  recipientPhone: items[0].recipientPhone,
                  isCart: true,
                  cartTotal: totalPrice,
                },
              })
            }
          >
            Proceed to Checkout
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;

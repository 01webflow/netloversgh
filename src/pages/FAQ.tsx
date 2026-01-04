import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { HelpCircle, CreditCard, Truck, Shield, MessageSquare, Wallet, RotateCcw, Users } from "lucide-react";

const faqCategories = [
  {
    icon: CreditCard,
    title: "Payments",
    faqs: [
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo Money) via Paystack and our in-app wallet. Using the wallet saves you transaction fees!",
      },
      {
        question: "How do I fund my wallet?",
        answer:
          "Go to your Dashboard, click on 'Wallet', then click the '+' button to add funds. You can fund your wallet using any Mobile Money service through our secure Paystack integration.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Absolutely! We use industry-standard encryption and never store your payment details. All transactions are processed through secure payment gateways like Paystack.",
      },
    ],
  },
  {
    icon: Truck,
    title: "Delivery",
    faqs: [
      {
        question: "How long does delivery take?",
        answer:
          "Delivery times vary by package type:\n• Instant Delivery: Within seconds\n• Swift Delivery: 1-5 minutes\n• Normal Delivery: 5-30 minutes during business hours",
      },
      {
        question: "Can I buy data for someone else?",
        answer:
          "Yes! When purchasing, simply enter the recipient's phone number instead of your own. The data will be delivered directly to that number.",
      },
      {
        question: "What happens if my order fails?",
        answer:
          "If your order fails, you'll receive a notification immediately. For wallet payments, you can request a refund through the admin team, and the amount will be credited back to your wallet.",
      },
    ],
  },
  {
    icon: Wallet,
    title: "Wallet & Pricing",
    faqs: [
      {
        question: "Are the prices the same as buying directly from the network?",
        answer:
          "Our prices are often lower than buying directly from network providers. We offer special wholesale rates that we pass on to our customers.",
      },
      {
        question: "What is the minimum amount I can purchase?",
        answer:
          "The minimum purchase varies by network, but our smallest packages start from as low as ₵4.50 for 1GB.",
      },
      {
        question: "Why should I use the wallet instead of Mobile Money?",
        answer:
          "Using your wallet saves you transaction fees on every purchase. Top up once and make multiple purchases without additional charges!",
      },
    ],
  },
  {
    icon: RotateCcw,
    title: "Refunds",
    faqs: [
      {
        question: "Can I get a refund if the data doesn't deliver?",
        answer:
          "Yes! If your data doesn't deliver within the specified time and your order is marked as failed, contact our support team and we'll process a refund to your wallet.",
      },
      {
        question: "How long do refunds take?",
        answer:
          "Refunds to your wallet are processed immediately once approved by our admin team. You'll receive an email notification when your refund is processed.",
      },
      {
        question: "Can I get a cash refund instead of wallet credit?",
        answer:
          "Currently, refunds are processed to your wallet balance. This allows you to make purchases immediately without waiting for bank transfers.",
      },
    ],
  },
  {
    icon: Users,
    title: "Agent Program",
    faqs: [
      {
        question: "How do I become an agent?",
        answer:
          "Visit the 'Become an Agent' page and submit your application. Once approved, you'll receive a unique referral code to share with customers and earn commissions on every sale.",
      },
      {
        question: "What commission rates do agents earn?",
        answer:
          "Agents earn competitive commission rates on every sale made using their referral code. Commission rates may vary based on performance and volume.",
      },
      {
        question: "How do agent payouts work?",
        answer:
          "Agent commissions accumulate in your pending payout balance. You can request a payout through your agent dashboard once you reach the minimum threshold.",
      },
    ],
  },
  {
    icon: MessageSquare,
    title: "Support",
    faqs: [
      {
        question: "How do I contact customer support?",
        answer:
          "You can reach us via:\n• WhatsApp: +233 XX XXX XXXX\n• Email: support@netloversgh.com\n• Visit our Contact page for more options",
      },
      {
        question: "What are your support hours?",
        answer:
          "Our support team is available Monday to Saturday, 8 AM to 10 PM GMT. For urgent issues outside these hours, you can still send a message and we'll respond as soon as possible.",
      },
      {
        question: "How can I track my order?",
        answer:
          "You can track all your orders in real-time from your Dashboard. Go to 'Orders' to see the status of all your purchases.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Help Center
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our data bundle services, payments, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {faqCategories.slice(0, 6).map((category, index) => (
              <a
                key={index}
                href={`#category-${index}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <category.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium text-foreground">{category.title}</span>
              </a>
            ))}
          </div>

          {/* FAQ Categories */}
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} id={`category-${categoryIndex}`} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{category.title}</h2>
              </div>
              
              <Accordion type="single" collapsible className="space-y-3">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`item-${categoryIndex}-${faqIndex}`}
                    className="bg-card rounded-xl border border-border px-6"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 whitespace-pre-line">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* Still have questions */}
          <div className="mt-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 text-center border border-primary/20">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Contact Support
              </Link>
              <a
                href="https://wa.me/233XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;

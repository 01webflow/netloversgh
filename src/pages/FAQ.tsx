import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const faqs = [
  {
    question: "How do I purchase data bundles?",
    answer:
      "Simply navigate to the 'Buy Data' section, select your preferred network provider (MTN, AT, or Telecel), choose your data package, enter the recipient phone number, and complete your payment using Mobile Money or your wallet balance.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery times vary by package type:\n- Instant Delivery: Within seconds\n- Swift Delivery: 1-5 minutes\n- Normal Delivery: 5-30 minutes during business hours",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo Money) and our in-app wallet. Using the wallet saves you transaction fees!",
  },
  {
    question: "How do I fund my wallet?",
    answer:
      "Go to your Dashboard, click on 'Wallet', then click the '+' button to add funds. You can fund your wallet using any Mobile Money service.",
  },
  {
    question: "Can I get a refund if the data doesn't deliver?",
    answer:
      "Yes! If your data doesn't deliver within the specified time, contact our support team and we'll process a refund or resend the bundle. Note that refunds are only possible before delivery.",
  },
  {
    question: "Are the prices the same as buying directly from the network?",
    answer:
      "Our prices are often lower than buying directly from network providers. We offer special wholesale rates that we pass on to our customers.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "You can reach us via:\n- WhatsApp: +233 XX XXX XXXX\n- Email: support@netloversgh.com\n- Visit our Contact page for more options",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Absolutely! We use industry-standard encryption and never store your payment details. All transactions are processed through secure payment gateways like Paystack.",
  },
  {
    question: "Can I buy data for someone else?",
    answer:
      "Yes! When purchasing, simply enter the recipient's phone number instead of your own. The data will be delivered directly to that number.",
  },
  {
    question: "What is the minimum amount I can purchase?",
    answer:
      "The minimum purchase varies by network, but our smallest packages start from as low as ₵4.50 for 1GB.",
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions about our data bundle services
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border px-6"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 whitespace-pre-line">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Still have questions */}
          <div className="mt-12 bg-primary/10 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Please contact our support team.
            </p>
            <a
              href="/contact"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;

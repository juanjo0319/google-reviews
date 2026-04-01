export default function MarketingTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in-up" style={{ animationDuration: "0.3s" }}>
      {children}
    </div>
  );
}

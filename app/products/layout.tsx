export default function ProductsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-slate-50">
      {children}

      {modal}
    </div>
  );
}
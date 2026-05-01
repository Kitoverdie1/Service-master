export default async function WorkOrderLayout({
  children,
  it,
  mt,
  params,
}: {
  children: React.ReactNode;
  it: React.ReactNode;
  mt: React.ReactNode;
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  switch (type) {
    case "it":
      return it;
    case "mt":
      return mt;
    default:
      return children;
  }
}

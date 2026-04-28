// Book detail page + voice conversation
interface BookPageProps {
  params: { slug: string };
}

export default function BookPage({ params }: BookPageProps) {
  return (
    <main>
      <h1>Book: {params.slug}</h1>
    </main>
  );
}

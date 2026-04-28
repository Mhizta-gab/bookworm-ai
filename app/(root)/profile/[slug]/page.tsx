// Public user profile page
interface ProfilePageProps {
  params: { slug: string };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <main>
      <h1>Profile: {params.slug}</h1>
    </main>
  );
}

import { Metadata } from 'next';
import { generateJobMetadata } from './metadata';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return generateJobMetadata(id);
}

// Force dynamic rendering to ensure fresh metadata for each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function JobLayout({ children }: Props) {
  return <>{children}</>;
}

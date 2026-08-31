import { Metadata } from 'next';
import { JOB_PAGE_REVALIDATE_SECONDS } from '@/lib/cachePolicy';
import { generateJobMetadata } from './metadata';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return generateJobMetadata(id);
}

export const revalidate = JOB_PAGE_REVALIDATE_SECONDS;

export default function JobLayout({ children }: Props) {
  return <>{children}</>;
}

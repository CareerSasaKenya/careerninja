import { Metadata } from 'next';
import { generateJobMetadata } from './metadata';

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generateJobMetadata(params.id);
}

export default function JobLayout({ children }: Props) {
  return <>{children}</>;
}

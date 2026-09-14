import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import Panel from '@/components/ui/Panel';
import type { ExploreCluster } from './types';

export default function ExplorePostCard({ cluster }: { cluster: ExploreCluster }) {
  const solutionCount = cluster.solutions?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Panel
        href={`/cluster/${cluster.id}`}
        accent="amber"
        className={`p-6 ${solutionCount > 0 ? 'status-stripe-solved' : 'status-stripe-open'}`}
      >
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-accent font-medium">{cluster.categoryLabel}</span>
          {solutionCount > 0 && (
            <span className="text-ink-muted">
              {solutionCount} solution{solutionCount === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <p className="text-ink font-medium text-base leading-relaxed">
          &quot;{cluster.canonicalText}&quot;
        </p>

        {cluster.sourceUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(cluster.sourceUrl, '_blank', 'noopener,noreferrer');
            }}
            className="mt-3 flex items-center gap-1 text-xs text-ink-muted hover:text-accent transition-colors cursor-pointer"
          >
            <ExternalLink className="h-3 w-3" />
            View source
          </button>
        )}
      </Panel>
    </motion.div>
  );
}

import type { ComponentProps } from 'react';
import { FeedbackVoteButton } from '@kookee/react/feedback/client';
import { Roadmap } from '@kookee/react/roadmap';

type RoadmapBoardProps = Pick<ComponentProps<typeof Roadmap>, 'columns' | 'posts'> & { apiKey: string };

/** One island: a vote button goes in through a function prop, which cannot cross from Astro. */
export function RoadmapBoard({ columns, posts, apiKey }: RoadmapBoardProps) {
  return (
    <Roadmap
      columns={columns}
      posts={posts}
      renderVotes={(post) => <FeedbackVoteButton post={post} config={{ apiKey }} />}
    />
  );
}

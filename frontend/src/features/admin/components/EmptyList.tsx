import type { FC } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, Plus } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyDescription,
  EmptyTitle,
  EmptyMedia,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

interface EmptyListProps {
  onClickButton?: React.MouseEventHandler<HTMLButtonElement>;
}

const EmptyList: FC<EmptyListProps> = ({ onClickButton }) => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Calendar />
        </EmptyMedia>
        <EmptyTitle>No Events Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any events yet. Get started by creating your
          first event.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Link to={`/admin/form`}>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </Link>
        </div>
      </EmptyContent>
    </Empty>
  );
};

export default EmptyList;

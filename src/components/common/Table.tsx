import { FC, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface TableProps {
  children: ReactNode;
  className?: string;
}

const Table: FC<TableProps> = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full divide-y divide-gray-200 dark:divide-gray-700", className)}>
        {children}
      </table>
    </div>
  );
};

export default Table;

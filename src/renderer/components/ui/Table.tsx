import React from 'react';
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';

const Table = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = 'Table';
Table.propTypes = {
  className: PropTypes.string,
};

const TableHeader = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn('[&_tr]:border-b', className)}
        {...props}
      />
    );
  }
);

TableHeader.displayName = 'TableHeader';
TableHeader.propTypes = {
  className: PropTypes.string,
};

const TableBody = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
      />
    );
  }
);

TableBody.displayName = 'TableBody';
TableBody.propTypes = {
  className: PropTypes.string,
};

const TableRow = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
          className
        )}
        {...props}
      />
    );
  }
);

TableRow.displayName = 'TableRow';
TableRow.propTypes = {
  className: PropTypes.string,
};

const TableHead = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
          className
        )}
        {...props}
      />
    );
  }
);

TableHead.displayName = 'TableHead';
TableHead.propTypes = {
  className: PropTypes.string,
};

const TableCell = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
        {...props}
      />
    );
  }
);

TableCell.displayName = 'TableCell';
TableCell.propTypes = {
  className: PropTypes.string,
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };

import s from './ClearFilters.module.scss';
import { OrderedSet } from 'immutable';
import React from 'react';
import { Consumer } from '~/lib/prelude.ts';

interface Props {
  setSelected: Consumer<OrderedSet<string>>
}

export const ClearFilters = ({ setSelected }: Props) =>
    <div className="flex justify-center w-full mt-5">
      <button
          className="p-2 max-h-50 text-sm border border-solid block rounded-lg border-slate-400 dark:bg-slate-900 dark:border-slate-800 bg-white dark:hover:bg-slate-800 dark:hover:border-indigo-500 group hover:bg-slate-100 hover:border-indigo-500"
          onClick={() => setSelected(OrderedSet())}>
        Clear Filters
      </button>
    </div>;

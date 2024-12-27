import { Selector } from './Selector';
import { ClearFilters } from './ClearFilters';
import { useState } from 'react';
import s from './Filter.module.scss';
import React from 'react';

export const Filter = ({ tags, selected, setSelected }) => {
  const [currCategory, setCurrCategory] = useState<string>(tags);
 
  tags.sort();

  return <search>
    <h2 className={s.h2}>Filter results</h2>
    <Selector tags={tags} selected={selected} setSelected={setSelected} currCategory={currCategory} setCurrCategory={setCurrCategory}/>
    {selected.size > 0 && <ClearFilters setSelected={setSelected}/>}
  </search>;
}

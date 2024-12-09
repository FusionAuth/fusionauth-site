import { Tag } from './Tag';
import clsx from 'clsx';
import { WithSelected } from '../QuickstartGallery';
import React from 'react';

interface Props extends WithSelected {
  tags: string[],
  listClass?: string,
  mainColor?: string,
  invertedColor?: string,
}

export const TagsList = ({ tags, listClass, selected, setSelected }: Props) => {

  const mappedTags = tags.map((tag) => ({tag, isSelected: selected.has(tag)}));

  const onClick = (event, tag) => {
    event.stopPropagation();
    setSelected((selected) => selected.has(tag) ? selected.delete(tag) : selected.add(tag));
  }

  return (
      <ul className={listClass}>
        {mappedTags.map(({ tag, isSelected }) => (
            <li key={tag}>
              <button className={isSelected ? "bg-indigo-700" : ""} onClick={event => onClick(event, tag)}>{tag}</button>
            </li>
        ))}
      </ul>
  );
}


import clsx from 'clsx';
import { WithSelected } from '../QuickstartGallery';
import React from 'react';

interface Props extends WithSelected {
  name: string,
  mainColor?: string,
  invertedColor?: string,
}

export const Tag = ({ selected, setSelected, name, mainColor, invertedColor }: Props) => {
  name = name.toLowerCase()
  const onClick = (event) => {
    event.stopPropagation();
    setSelected((selected) => selected.has(name) ? selected.delete(name) : selected.add(name));
  }
  
  const isSelected = selected.has(name);

  return <li>
    <button className={isSelected ? "bg-indigo-700" : ""} onClick={onClick}>{name}</button>
  </li>;
}
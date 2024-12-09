// noinspection t

import { WithSelected } from '../../QuickstartGallery';
import { CardInfo } from '../../apps';
import React from 'react';

export const Card = ({ title, description, tags, icon, codeRoot, selected, setSelected }: CardInfo & WithSelected) => {

  for (const value of selected) {
    if (!tags.includes(value)) {
      return null;
    }
  }

  const rawPrefix = "https://raw.githubusercontent.com/";
  const repoPrefix = "https://github.com/";
  const modifiedUrl:string = codeRoot.replace(rawPrefix, repoPrefix).replace('/main', '');

  const mappedTags = tags.map((tag) => ({tag, isSelected: selected.has(tag)}));

  const onTagClick = (event, tag) => {
    event.stopPropagation();
    setSelected((selected) => selected.has(tag) ? selected.delete(tag) : selected.add(tag));
  }

  return (
      <a href={modifiedUrl} target="_blank" rel="noopener noreferrer"
         className={"max-h-50 border border-solid block rounded-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800 bg-white dark:hover:bg-slate-800 dark:hover:border-indigo-500 group hover:bg-slate-100 hover:border-indigo-500"}>
        <div className={"flex justify-between items-center my-2"}>
          <img className={"w-10 h-10 mx-10"} alt={title} src={`https://fusionauth.io${icon}`}/>
          <div className={"flex flex-col flex-grow justify-around"}>
            <h3 style={ {margin: 0}} className={"my-0"}>{title}</h3>
            <p className={"my-0"}>{description}</p>
          </div>
          <ul className={"mr-10 my-0 flex flex-col flex-grow basis-2 flex-wrap"}>
            {mappedTags.map(({tag, isSelected}, tagIdx) => (
                <li className={"px-2 py-1 my-2 mx-2 border border-solid block rounded-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800 bg-white dark:hover:bg-slate-800 dark:hover:border-indigo-500 group hover:bg-slate-100 hover:border-indigo-500 list-none w-20 text-center " + (isSelected ? "dark:bg-indigo-700 text-white bg-indigo-400" : "")} key={tag + tagIdx}>
                  <button className={""} onClick={event => onTagClick(event, tag)}>{tag}</button>
                </li>
            ))}
          </ul>
        </div>
      </a>
  );
};
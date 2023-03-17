import React from 'react';

const ListView = ({ data, links, className }) => {
  const elements = Object.keys(data).map((key, index) => {
    return (
      <li key={`${key}-${index}`}>
        <h5>{key}</h5>
        {
          links?.includes(key) ?
          <a href={data[key]} target="_blank">{data[key]}</a> :
          <span>{data[key]}</span>
        }
      </li>
    )
  });

  return (
    <ul className={`list-view ${className}`}>
      {elements}
    </ul>
  );
};

export default ListView;

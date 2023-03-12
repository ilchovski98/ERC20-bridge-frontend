import React from 'react';

function Panel({ children, className, ...rest }) {
  return (
    <div {...rest} className={'panel ' + className}>
      {children}
    </div>
  );
}

export default Panel;

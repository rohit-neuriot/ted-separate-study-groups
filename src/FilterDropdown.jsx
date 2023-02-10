import React from 'react';
import Select from 'react-select';

export default ({type, data, defaultValue, isEnabled, value, reRender }) => {
  return (
    <>
      <div style={{width: 550, position: "relative", zIndex: 999}}>
        <Select
            isMulti
            onChange={(e) => reRender(e, type)}
            className="basic-single"
            classNamePrefix="select"
            defaultValue={defaultValue ? data[0] : false}
            // isDisabled={!isEnabled}
            isClearable={false}
            name="color"
            options={data}
            value={value}
        />
      </div>
    </>
  );
};
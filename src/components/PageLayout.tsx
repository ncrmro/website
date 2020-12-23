import React from "react";

/**
 * The PageLayout component provides a singular way to manage out page sizine
 */
const PageLayout: React.FC<{ children; id?: string }> = (props) => {
  return (
    <div id={props.id} className="bg-gray-50 container mx-auto min-h-full mt-4">
      {props.children}
    </div>
  );
};

export default PageLayout;

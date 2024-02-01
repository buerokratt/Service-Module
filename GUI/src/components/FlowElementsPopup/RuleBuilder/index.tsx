import React from "react";
import FilterBuilder from "./ruleGroupBuilder";
import '../styles.scss';

const RuleBuilder: React.FC = () => {
  return <>
    <FilterBuilder
      onChange={(config) => {
        console.log(config);
      }}
    />
  </>;
}

export default RuleBuilder;

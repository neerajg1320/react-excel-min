export const listToOptions = (items, title) => {
  if (items.length) {
    return [{label: `Select ${title} ...`, value: ''}]
        .concat(items.map((item) => {return {label: item, value:item}}));
  }

  return [];
}
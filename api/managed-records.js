import fetch from "../util/fetch-fill";
import URI from "urijs";

window.path = "http://localhost:3000/records";

const retrieve = (options = {}) => {
  options = { page: options.page || 1, colors: options.colors || [] };
  const { page, colors } = options;
  const startPage = (page * 10) - 10;

  let uri = new URI(window.path)
    .addSearch("limit", 10)
    .addSearch("offset", startPage);
  colors && uri.addSearch("color[]", colors);

  return fetch(uri)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed with error code " + response.status)
      };
    })
    .then(data => {
      const revisedData = data.map(item => {
        return {
          ...item, 
          isPrimary: item.color === "red" || 
            item.color === "blue" || 
            item.color === "yellow" ? true : false
        }
      });

      const currentIds = revisedData.map(indEl => indEl.id);
      const currentOpenItems = revisedData.filter(indEl => indEl.disposition === "open");
      const currentClosedPrimaryCount = revisedData.filter(indEl => indEl.disposition === "closed" && indEl.isPrimary).length;

      const finalData = {
        ids: currentIds,
        open: currentOpenItems,
        closedPrimaryCount: currentClosedPrimaryCount,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page < 50 && currentIds.length ? page + 1 : null
      };

      // The nextPage value if statement works for this dataset because there are max 500 data items.  A future iteration would would make this more dynamic to allow for various sizes of datasets.

      return finalData;
    })
    .catch(error => console.log(error))
};

export default retrieve;

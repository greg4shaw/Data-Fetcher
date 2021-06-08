const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num);
  const list = pages.map((page) => {
    return (
      <button
        type="button"
        className="btn btn-outline-primary btn-lg"
        key={page}
        onClick={onPageChange}
      >
        {page}
      </button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};
// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://hn.algolia.com/api/v1/search?query=MIT",
    {
      hits: [],
    }
  );
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.hits;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <Fragment>
      <form
        onSubmit={(event) => {
          doFetch(`http://hn.algolia.com/api/v1/search?query=${query}`);
          event.preventDefault();
        }}
      >
        <div className="input-group mb-3">
          <button
            className="btn btn-outline-secondary"
            type="submit"
            id="button-addon1"
          >
            Search
          </button>
          <input
            type="text"
            className="form-control"
            placeholder="Your search term"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <br></br>
        <div class="input-group input-group-default">
          <span class="input-group-text" id="inputGroup-sizing-default">
            Page Size
          </span>
          <input
            type="number"
            min="1"
            class="form-control"
            value={pageSize}
            onChange={(event) => setPageSize(event.target.value)}
          />
        </div>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul class="list-group">
          {page.map((item) => (
            <li key={item.objectID}>
              <a
                class="list-group-item list-group-item-action list-group-item-info"
                href={item.url}
              >
                {item.title} | Comments: {item.num_comments}
              </a>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        items={data.hits}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));

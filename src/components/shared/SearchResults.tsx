
import Loader from './Loader';
import GridPostList from './GridPostList';

type SearchResultProps = {
  isSearchFetching:boolean;
  searchedPosts:any;
};

const SearchResults = ({isSearchFetching,searchedPosts}:SearchResultProps) => {

  if(isSearchFetching) {
    return <Loader />;
  }

  if(searchedPosts && searchedPosts.documents.length > 0){
    return <GridPostList posts={searchedPosts.documents} />;
  }

  return (
    <div className="flex-center">
      <p className="text-light-4 text-center mt-10 w-full">
        No Result Found!!!
      </p>
    </div>
  );
}

export default SearchResults;
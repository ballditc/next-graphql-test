import React, { Suspense, useState, useEffect, useCallback, useRef } from "react";
import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  useQuery,
  gql,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "https://api.uat.services.dmd.co.th/",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: "www",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const FILMS_QUERY = gql`
  query Seminar_courses($filter: SeminarCourseFilter, $limit: Int, $offset: Int) {
    seminar_courses(filter: $filter, limit: $limit, offset: $offset) {
      count
      rows {
        id
        course_name_th
        course_code
        dates {
          course_date
          course_time
        }
        booking_relations {
          booking {
            id
            financial_invoice {
              id
              invoice_full
              invoice_price
              invoice_discount
              invoice_subtotal
              invoice_vat
              invoice_total
            }
            customer_billing_th
            relation_attendees {
              backup_code
            }
          }
        }
      }
    }
  }
`;

const ChildComponent: React.FC = () => {
  const limit = 10;
  const [offset, setOffset] = useState(0);
  const [courses, setCourses] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data, loading, error, fetchMore } = useQuery(FILMS_QUERY, {
    variables: {
      filter: {
        state: 1,
      },
      limit: limit,
      offset: offset,
    },
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = useCallback(async () => {
    setIsFetching(true);
    await fetchMore({
      variables: {
        offset: offset + limit,
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prevResult;
        return {
          seminar_courses: {
            ...fetchMoreResult.seminar_courses,
            rows: [
              ...prevResult.seminar_courses.rows,
              ...fetchMoreResult.seminar_courses.rows,
            ],
          },
        };
      },
    });
    setOffset((prevOffset) => prevOffset + limit);
    setIsFetching(false);
  }, [offset, limit, fetchMore]);

  useEffect(() => {
    if (data?.seminar_courses) {
      setCourses((prevCourses) => [...prevCourses, ...data.seminar_courses.rows]);
    }
  }, [data]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && !isFetching) {
        loadMore();
      }
    });
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [loading, isFetching, loadMore]);

  if (error) return <pre>{error.message}</pre>;

  return (
    <div>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>{course.course_name_th}</li>
        ))}
      </ul>
      <div>{loading ? "Loading..." : ""}</div>
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
};

const TestComponent: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <Suspense fallback="Loading...">
        <ChildComponent />
      </Suspense>
    </ApolloProvider>
  );
};

export default TestComponent;

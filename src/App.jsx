import { useEffect, useState, useRef } from "react";

export default function App() {
  const [posts, setPosts] = useState([]);
  // 1. 화면에 표시할 데이터 개수를 관리하는 상태 추가
  const [displayedCount, setDisplayedCount] = useState(10);
  const ITEMS_PER_PAGE = 10;

  // 2. 마지막 요소를 감지하기 위한 ref 추가
  const lastPostRef = useRef(null);

  useEffect(() => {
    async function getPosts() {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! ${res.status}`);
        }

        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error(error);
      }
    }

    getPosts();
  }, []);

  // 3. Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 마지막 요소가 뷰포트에 들어왔고, 아직 표시하지 않은 데이터가 있을 때
        if (entries[0].isIntersecting && displayedCount < posts.length) {
          // 표시할 개수를 증가시킴 (한 번에 ITEMS_PER_PAGE개씩 추가)
          setDisplayedCount((prev) =>
            Math.min(prev + ITEMS_PER_PAGE, posts.length)
          );
        }
      },
      { threshold: 1.0 } // 요소가 완전히 보일 때 트리거
    );

    // 마지막 요소를 관찰 대상으로 설정
    if (lastPostRef.current) {
      observer.observe(lastPostRef.current);
    }

    // cleanup 함수에서 observer 해제
    return () => {
      if (lastPostRef.current) {
        observer.unobserve(lastPostRef.current);
      }
    };
  }, [displayedCount, posts.length]);

  // 4. displayedCount만큼만 데이터를 잘라서 표시
  const displayedPosts = posts.slice(0, displayedCount);

  return (
    <div style={{ padding: "10px 30px" }}>
      {/* 5. displayedPosts를 사용하여 일부만 렌더링 */}
      {displayedPosts.map((post, index) => {
        return (
          <div
            key={post.id}
            // 6. 마지막으로 표시된 요소에 ref 연결
            ref={index === displayedPosts.length - 1 ? lastPostRef : null}
          >
            <h2>
              {post.id}. {post.title}
            </h2>
            <div>{post.body}</div>
          </div>
        );
      })}
    </div>
  );
}

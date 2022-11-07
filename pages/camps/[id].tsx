import React from "react";
import { GetServerSideProps } from "next";
import Layout from "../../components/Layout";
import Router from "next/router";
import { PostProps } from "../../components/Post";
import prisma from "../../lib/prisma";
import { useSession } from "next-auth/react";
import { Button, Text, Box, Stack, Avatar, Flex } from "@chakra-ui/react";
import ReviewForm from "../../components/ReviewForm";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(params?.id) || -1,
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
      reviews: {
        select: { rating: true, description: true },
      },
    },
  });
  return {
    props: { post },
  };
};

async function deletePost(id: number): Promise<void> {
  await fetch(`http://localhost:3000/api/post/${id}`, {
    method: "DELETE",
  });
  await Router.push("/");
}

const Post: React.FC<{ post: PostProps }> = ({ post }) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Authenticating ...</div>;
  }
  const userHasValidSession = Boolean(session);
  const postBelongsToUser = session?.user?.email === post.author?.email;

  return (
    <Layout>
      <div>
        <h2>{post.name}</h2>
        <p>By {post?.author?.name || "Unknown author"}</p>
        <Text>{post.description}</Text>
        {userHasValidSession && postBelongsToUser && (
          <Button onClick={() => deletePost(post.id)} colorScheme="red">
            Delete
          </Button>
        )}
      </div>
      {session && <ReviewForm />}
      <Stack spacing={3} mt={3}>
        <Text fontSize="2xl" fontWeight={500}>
          Reviews
        </Text>
        {post.reviews.map((review) => (
          <Box border="1px solid grey" borderRadius="lg" p={3} key={review.id}>
            <Flex alignItems="center" mb={2}>
              <Avatar mr={2} size="sm" />
              {post.author.name}
            </Flex>
            <Text>"{review.description}"</Text>
          </Box>
        ))}
      </Stack>
    </Layout>
  );
};

export default Post;
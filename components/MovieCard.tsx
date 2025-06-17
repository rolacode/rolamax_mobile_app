import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {Link} from "expo-router";
import {icons} from "@/constants/icons";

const MovieCard = ({ id, poster_path, title, vote_average, release_date}: Movie) => {
  return (
    <View>
      <Link href={`/movies/${id}`} asChild>
          <TouchableOpacity className="w-[100]">
              <Image
                  source={{
                      uri: poster_path
                          ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                          : 'https://placeholder.co/600x400/1a1a1a/ffffff.png'
              }}
                  className="w-full h-52 rounded-lg"
                  resizeMode="cover"
              />


              <Text className="text-white text-sm font-bold mt-2" numberOfLines={1}>{title}</Text>

              <View className="flex-row items-center justify-between gap-x-1 mt-2">
                    <Image source={icons.star} className="size-4" resizeMode="contain" />
                    <Text className="text-white text-xs font-bold uppercase">{Math.round(vote_average / 2)}</Text>
              </View>

              <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-light-300 font-medium mt-1">{release_date?.split('-')[0]}</Text>
                  {/*<Text className="text-xs text-light-300 font-medium uppercase">movie</Text>*/}
              </View>
          </TouchableOpacity>
      </Link>
    </View>
  );
};

export default MovieCard;

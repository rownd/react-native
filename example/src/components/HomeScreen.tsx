import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, View, Dimensions, Linking, ScrollView, SafeAreaView } from 'react-native';
import { useRownd } from "../../rownd-rn/src";
import tw from '../utils/tailwind';
import React, { useEffect, useState } from 'react';
import RenderHtml from 'react-native-render-html';
import ky from 'ky';
import { Card, Text, Button, Tile } from '@rneui/themed';

import Swoop1SVG from './svgs/Swoop-1';
import Swoop2SVG from './svgs/Swoop-2';
import Swoop3SVG from './svgs/Swoop-3';

import ImageHomeBanner from '../../assets/home-banner.svg';

const rssParser = require('react-native-rss-parser');

export function HomeScreen() {
    const { requestSignIn, signOut, auth, user } = useRownd();
    const [feed, setFeed] = useState<any[]>([]);

    const { width, height } = Dimensions.get("window");

    useEffect(() => {
        (async () => {
            let body = await ky.get('https://blog.rownd.io/feed').text();
            let feed = await rssParser.parse(body);
            setFeed(feed.items);
            // console.log(feed.items[0]);
        })();
    }, []);

    function launchBlog(url: string) {
        if (!url) { return; }
        Linking.openURL(url);
    }

    function signOutHandler() {
        console.log('signing out');
        signOut();
    }

    return (
        <>
            <View style={styles.wrapper}>
                <ScrollView contentContainerStyle={styles.container}>
                    <ImageHomeBanner height={150} width={width} />
                    {feed.length > 0 &&
                        <Pressable onPress={() => launchBlog(feed[0]?.links[0]?.url!)}>
                            <Card containerStyle={styles.blogCard}>
                                <Card.Title>{feed[0].title!}</Card.Title>
                                <Card.Divider />
                                <RenderHtml source={{ html: feed[0].description }} contentWidth={width} />
                            </Card>
                        </Pressable>
                    }

                    <View style={styles.signInArea}>
                        {!auth.access_token && (
                            <Button onPress={() => requestSignIn()} color='#5b0ae0'>
                                <Text style={tw.style('buttonContent')}>Sign in with Rownd</Text>
                            </Button>
                        )}
                        {auth.access_token && (
                            
                                <Button onPress={() => signOutHandler()} style={{zIndex: 1000 }}>
                                    <Text style={tw.style('buttonContent')}>Sign out</Text>
                                </Button>
                            
                        )}
                    </View>
                </ScrollView>
            </View>
            {/* <Swoop1SVG style={[styles.swoop, styles.swoop1]} fill="#5B13Df" width={width} />
            <Swoop2SVG style={[styles.swoop, styles.swoop2]} fill="#5B13Df" width={width} />
            <Swoop3SVG style={[styles.swoop, styles.swoop3]} fill="#5B13Df" width={width} /> */}
            <StatusBar style="auto" />
        </>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        height: '100%',
    },
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
    },
    swoop: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 300,
        // width: '100%',
        zIndex: 1,
    },
    swoop1: {
        height: 300,
    },
    swoop2: {
        height: 270,
    },
    swoop3: {
        height: 185,
    },
    blogCard: {
        backgroundColor: '#efefef',
    },
    signInArea: {
        padding: 25,
        width: '100%',
        zIndex: 100
    },
    button: {
        color: '#5b0ae0',
    },
    signedInMessage: {
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#dedede',
    }
});
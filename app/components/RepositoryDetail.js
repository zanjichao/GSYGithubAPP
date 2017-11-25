/**
 * Created by guoshuyu on 2017/11/10.
 */

import React, {Component} from 'react';
import {
    View, Text, StatusBar, TextInput, TouchableOpacity, Keyboard
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import styles from "../style"
import * as Constant from "../style/constant"
import I18n from '../style/i18n'
import repositoryActions from '../store/actions/repository'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import EventItem from './widget/EventItem'
import CommonRowItem from './widget/CommonRowItem'
import CustomSearchButton from './widget/CustomSearchButton'
import PullListView from './widget/PullLoadMoreListView'
import RepositoryHeader from './widget/RepositoryHeader'
import Icon from 'react-native-vector-icons/Ionicons'
import resolveTime from '../utils/timeUtil'

/**
 * 详情
 */
class RepositoryDetail extends Component {

    constructor(props) {
        super(props);
        this._refresh = this._refresh.bind(this);
        this._loadMore = this._loadMore.bind(this);
        this.page = 2;
        this.state = {
            dataDetail: {}
        }
    }

    componentDidMount() {
        repositoryActions.getRepositoryDetail(this.props.ownerName, this.props.repositoryName)
            .then((res) => {
                console.log("****************", res);
                if (res && res.result) {
                    this.setState({
                        dataDetail: res.data
                    })
                }
            })
    }

    componentWillUnmount() {

    }

    componentWillReceiveProps(newProps) {
    }


    _renderRow(rowData, sectionID, rowID, highlightRow) {
        return (
            <View/>
        )
    }

    /**
     * 刷新
     * */
    _refresh() {

    }

    /**
     * 加载更多
     * */
    _loadMore() {
    }


    render() {
        let {
            forks_count, fork, open_issues_count, size, watchers_count,
            subscribers_count, description, language, created_at, pushed_at, parent
        } = this.state.dataDetail;
        return (
            <View style={styles.mainBox}>
                <StatusBar hidden={false} backgroundColor={'transparent'} translucent barStyle={'light-content'}/>
                <RepositoryHeader
                    ownerName={this.props.ownerName}
                    repositoryName={this.props.repositoryName}
                    repositoryStar={watchers_count + ""}
                    repositoryFork={forks_count + ""}
                    repositoryWatch={subscribers_count + ""}
                    repositoryIssue={open_issues_count + ""}
                    repositorySize={(size / 1024).toFixed(2) + "M"}
                    repositoryType={language}
                    repositoryDes={description}
                    repositoryIsFork={fork}
                    repositoryParentName={parent ? parent.full_name : null}
                    created_at={resolveTime(created_at)}
                    push_at={resolveTime(pushed_at)}
                />
            </View>
        )
    }
}


export default RepositoryDetail
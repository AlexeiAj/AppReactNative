import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { Input, Card, Text, Button, Overlay, Header } from 'react-native-elements';
import { StyleSheet, FlatList, ScrollView, View } from 'react-native';
import Post from '../component/Post';
import ListaFotos from '../component/ListaFotos';
import { REACT_APP_URL } from 'react-native-dotenv';
import Icon from 'react-native-vector-icons/FontAwesome';
import DatePicker from 'react-native-datepicker';

export default class Feed extends Component {

    constructor(props){
        super(props);
        this.state = { 
            posts: [],
            openAdicionar: false,
            usuario: '',
            errMsg: '',
            post_titulo: '',
            post_data: '',
            post_categoria: '',
            texto: '',
            imagem: '',
            link: ''
        }
    }

    static navigationOptions = { header: null };

    componentDidMount() {
        this.props.navigation.addListener("willFocus", () => this.recarregarPosts());
    }

    recarregarPosts() {
        let url = `${REACT_APP_URL}/posts`;

        AsyncStorage.getItem('token')
            .then(token => {
                return {
                    headers: new Headers({
                        'Authorization': token
                    })
                }
            })
            .then(requestInfo => fetch(url, requestInfo))
            .then(response => response.json())
            .then(json => this.setState({ posts: [].concat(json) }));

        AsyncStorage.getItem('usuario')
            .then(usuario => this.setState({usuario: usuario}));
    }

    removerToken() {
        AsyncStorage.clear();
        this.props.navigation.navigate('Auth');
    }
    
    openCloseModalAdicionar(isOpen){
        this.setState({ openAdicionar: isOpen });
    }

    adicionar() {
        let url = `${REACT_APP_URL}/posts`;

        let post_conteudo = JSON.stringify({
            texto: this.state.texto,
            imagem: this.state.imagem,
            link: this.state.link
        });

        AsyncStorage.getItem('token')
            .then(token => {
                return {
                    method: 'POST',
                    body: JSON.stringify({
                        post_titulo: this.state.post_titulo,
                        post_data: this.state.post_data,
                        post_categoria: this.state.post_categoria,
                        post_conteudo: post_conteudo
                    }),
                    headers: new Headers({
                        'Content-type': 'application/json',
                        'Authorization': token
                    })
                }
            })
            .then(requestInfo => fetch(url, requestInfo))
            .then(response => {
                if(response.ok){
                    this.setState({
                        openAdicionar: false,
                        usuario: '',
                        errMsg: '',
                        post_titulo: '',
                        post_data: '',
                        post_categoria: '',
                        texto: '',
                        imagem: '',
                        link: '' 
                    });
                    this.recarregarPosts();
                    return;
                } 
                throw new Error("Não foi possível adicionar o post.");
            })
            .catch(e => this.setState({errMsg: e.message}));
    }

    home(){
        this.props.navigation.replace('Feed');
    }

    galeria(){
        this.props.navigation.replace('Galeria');
    }

    selecionarFotoGaleria(path){
        this.setState({imagem: path});
    }

    render() {
        return (
            <ScrollView>
                <Header
                    leftComponent={<Icon name="home" size={24} onPress={this.home.bind(this)}/>}
                    centerComponent={{ text: "Alexei Aj", style: { color: "#fff" }}}
                    rightComponent={<Icon name="photo" size={24} onPress={this.galeria.bind(this)}/>}
                >
                </Header>
                <Card>
                    <FlatList 
                        data={this.state.posts} 
                        keyExtractor={item => String(item.id)} 
                        renderItem={ ({item}) => 
                            <Post post={item} recarregarPostsCallback={() => this.recarregarPosts()}/>
                        }
                    />
                    <Button type="clear" title="Adicionar" onPress={this.openCloseModalAdicionar.bind(this, true)}/>
                    <Button type="clear" title={`Deslogar de ${this.state.usuario}`} onPress={this.removerToken.bind(this)}/>
                </Card>
                <Overlay isVisible={this.state.openAdicionar} onBackdropPress={this.openCloseModalAdicionar.bind(this, false)}>
                    <View>
                        <Input placeholder="Título" autoCapitalize="none" onChangeText={texto => this.setState({post_titulo: texto})}/>
                        <Input placeholder="Link" autoCapitalize="none" onChangeText={texto => this.setState({link: texto})}/>
                        <DatePicker date={this.state.post_data} format="YYYY-MM-DD" onDateChange={(date) => {this.setState({post_data: date})}}/>
                        <Input placeholder="Categoria" autoCapitalize="none" onChangeText={texto => this.setState({post_categoria: texto})}/>
                        <Input placeholder="Texto" autoCapitalize="none" onChangeText={texto => this.setState({texto: texto})}/>
                        <Input disabled={true} value={this.state.imagem} autoCapitalize="none" onChangeText={texto => this.setState({imagem: texto})}/>
                        <ListaFotos selecionarCallback={this.selecionarFotoGaleria.bind(this)}/>
                        <Text style={styles.errMsg}>{this.state.errMsg}</Text>
                        <Button type="clear" title="Adicionar" onPress={this.adicionar.bind(this)}/>
                        <Button type="clear" title="Cancelar" onPress={this.openCloseModalAdicionar.bind(this, false)}/>
                    </View>
                </Overlay>
            </ScrollView>
        );
    }
    
}

const styles = StyleSheet.create({
    errMsg: {
        color: 'red',
    }
});
